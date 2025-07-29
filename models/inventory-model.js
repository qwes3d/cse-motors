const pool = require('../database');
const invModel = {};


/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}


async function getInventoryById(inv_id) {
  try {
    const result = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    )
    return result.rows[0]
  } catch (error) {
    console.error("getInventoryById error", error)
  }
}


async function addClassification(classification_name) {
  try {
    const sql = `INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *`;
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (error) {
    throw new Error(error);
  }
}


invModel.addInventory = async function (vehicle) {
  const sql = `
    INSERT INTO inventory (
      classification_id, inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`;

  const values = [
    vehicle.classification_id,
    vehicle.inv_make,
    vehicle.inv_model,
    vehicle.inv_year,
    vehicle.inv_description,
    vehicle.inv_image,
    vehicle.inv_thumbnail,
    vehicle.inv_price,
    vehicle.inv_miles,
    vehicle.inv_color
  ];

  try {
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error("Model Error adding inventory:", error);
    return null;
  }
}

/* ***************************
 * Update Inventory in Database
 * ************************** */
async function updateInventory(inventoryData) {
  try {
    const sql = `UPDATE inventory SET
      inv_make = $1,
      inv_model = $2,
      inv_year = $3,
      inv_description = $4,
      inv_image = $5,
      inv_thumbnail = $6,
      inv_price = $7,
      inv_miles = $8,
      inv_color = $9,
      classification_id = $10
      WHERE inv_id = $11
      RETURNING *`;
    
    const result = await pool.query(sql, [
      inventoryData.inv_make,
      inventoryData.inv_model,
      inventoryData.inv_year,
      inventoryData.inv_description,
      inventoryData.inv_image,
      inventoryData.inv_thumbnail,
      inventoryData.inv_price,
      inventoryData.inv_miles,
      inventoryData.inv_color,
      inventoryData.classification_id,
      inventoryData.inv_id
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error("Model update error:", error);
    throw error;
  }
}


// In your model
async function hasChanges(inv_id, newData) {
  const current = await getInventoryById(inv_id);
  return Object.keys(newData).some(key => current[key] != newData[key]);
}

/* ***************************
 * Delete Inventory Item
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1 RETURNING *';
    const result = await pool.query(sql, [inv_id]);
    return result.rowCount === 1;
  } catch (error) {
    console.error("Delete model error:", error);
    throw error;
  }
}




module.exports = {
  getClassifications,
  addClassification,
  getInventoryByClassificationId,
  getInventoryById,
  updateInventory,
  hasChanges,
  deleteInventory,
  
}
