import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import fs from "fs"
import path from "path"

interface CatalogProduct {
  name: string
  sku: string
  barcode: string | null
  carton_qty: string | null
}

export default async function import_catalog_products({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("Starting catalog product import...")

  // Load catalog JSON
  const catalogPath = path.join(process.cwd(), "catalog_products.json")
  if (!fs.existsSync(catalogPath)) {
    logger.error(`catalog_products.json not found at ${catalogPath}`)
    return
  }

  const products: CatalogProduct[] = JSON.parse(
    fs.readFileSync(catalogPath, "utf-8")
  )
  logger.info(`Loaded ${products.length} products from catalog`)

  // Get existing shipping profile
  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const shippingProfile = shippingProfiles[0]

  // Get default sales channel
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
  })
  const salesChannel = salesChannels[0]

  // Fetch already-imported SKUs to allow safe re-runs
  const { data: existingVariants } = await query.graph({
    entity: "product_variant",
    fields: ["sku"],
    filters: {},
  })
  const importedSkus = new Set(existingVariants.map((v: { sku: string }) => v.sku))
  logger.info(`Found ${importedSkus.size} existing variants — will skip these`)

  // Seed seenBarcodes with barcodes already in DB so we don't re-use them
  const { data: existingBarcodeVariants } = await query.graph({
    entity: "product_variant",
    fields: ["barcode"],
    filters: {},
  })
  const seenBarcodes = new Set<string>(
    existingBarcodeVariants
      .map((v: { barcode: string | null }) => v.barcode)
      .filter(Boolean) as string[]
  )
  const toImport = products.filter((p) => !importedSkus.has(p.sku))
  logger.info(`${toImport.length} products to import (${products.length - toImport.length} already exist)`)

  // Import in batches of 50 to avoid timeout
  const BATCH_SIZE = 50
  let imported = 0
  let failed = 0

  for (let i = 0; i < toImport.length; i += BATCH_SIZE) {
    const batch = toImport.slice(i, i + BATCH_SIZE)

    const productsInput = batch.map((p) => {
      // Null out duplicate barcodes — Medusa enforces global uniqueness
      let barcode: string | undefined = undefined
      if (p.barcode && !seenBarcodes.has(p.barcode)) {
        seenBarcodes.add(p.barcode)
        barcode = p.barcode
      }

      const handle = `shamay-${p.sku}`
      return {
        title: p.name || `מוצר ${p.sku}`,
        handle,
        status: ProductStatus.PUBLISHED,
        shipping_profile_id: shippingProfile?.id,
        metadata: {
          sku: p.sku,
          barcode: p.barcode,
          carton_qty: p.carton_qty,
          source: "catalog_import",
        },
        options: [{ title: "Default", values: ["Standard"] }],
        variants: [
          {
            title: "Standard",
            sku: p.sku,
            barcode,
            manage_inventory: false,
            options: { Default: "Standard" },
            prices: [],
          },
        ],
        sales_channels: salesChannel ? [{ id: salesChannel.id }] : [],
      }
    })

    try {
      await createProductsWorkflow(container).run({
        input: { products: productsInput },
      })
      imported += batch.length
      logger.info(`Imported ${imported}/${toImport.length} products...`)
    } catch (err) {
      failed += batch.length
      logger.error(`Batch ${i / BATCH_SIZE + 1} failed: ${(err as Error).message}`)
    }
  }

  logger.info(`Import complete: ${imported} imported, ${failed} failed`)
}
