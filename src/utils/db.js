import { supabase } from "./supabase";

// ── mappers ──────────────────────────────────────────────────────────

function orderFromDb(row) {
  return {
    id:           row.id,
    code:         row.code          ?? "",
    name:         row.name          ?? "",
    phone:        row.phone         ?? "",
    totalPrice:   row.total_price   ?? "",
    paidAmount:   row.paid_amount   ?? "0",
    currency:     row.currency      ?? "IQD",
    paymentLog:   row.payment_log   ?? [],
    style:        row.style         ?? "",
    fabric:       row.fabric        ?? "",
    status:       row.status        ?? "pending",
    notes:        row.notes         ?? "",
    orderDate:    row.order_date    ?? "",
    deliveryDate: row.delivery_date ?? "",
    measurements: row.measurements  ?? {},
    fabricColor:  row.fabric_color  ?? "",
    fabricPhoto:  row.fabric_photo  ?? "",
  };
}

function orderToDb(order, branchId) {
  return {
    id:             order.id,
    branch_id:      branchId,
    code:           order.code,
    name:           order.name,
    phone:          order.phone,
    total_price:    order.totalPrice   ?? "",
    paid_amount:    order.paidAmount   ?? "0",
    currency:       order.currency     ?? "IQD",
    payment_log:    order.paymentLog   ?? [],
    style:          order.style        ?? "",
    fabric:         order.fabric       ?? "",
    status:         order.status,
    notes:          order.notes        ?? "",
    order_date:     order.orderDate    ?? "",
    delivery_date:  order.deliveryDate ?? "",
    measurements:   order.measurements ?? {},
    fabric_color:   order.fabricColor  ?? "",
    fabric_photo:   order.fabricPhoto  ?? "",
  };
}

function profileFromDb(row) {
  return {
    id:           row.id,
    name:         row.name          ?? "",
    phone:        row.phone         ?? "",
    measurements: row.measurements  ?? {},
    notes:        row.notes         ?? "",
    createdAt:    row.created_at?.split("T")[0] ?? "",
  };
}

function profileToDb(profile, branchId) {
  return {
    id:           profile.id,
    branch_id:    branchId,
    name:         profile.name,
    phone:        profile.phone        ?? "",
    measurements: profile.measurements ?? {},
  };
}

// ── orders ────────────────────────────────────────────────────────────

export async function loadOrders(branchId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("branch_id", branchId)
    .order("created_at", { ascending: false });
  if (error) { console.error("loadOrders:", error.message); return null; }
  return data.map(orderFromDb);
}

export async function upsertOrder(order, branchId) {
  const { error } = await supabase
    .from("orders")
    .upsert(orderToDb(order, branchId), { onConflict: "id" });
  if (error) console.error("upsertOrder:", error.message);
}

export async function deleteOrder(id) {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) console.error("deleteOrder:", error.message);
}

// ── profiles ──────────────────────────────────────────────────────────

export async function loadProfiles(branchId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("branch_id", branchId)
    .order("created_at", { ascending: false });
  if (error) { console.error("loadProfiles:", error.message); return null; }
  return data.map(profileFromDb);
}

export async function upsertProfile(profile, branchId) {
  const { error } = await supabase
    .from("profiles")
    .upsert(profileToDb(profile, branchId), { onConflict: "id" });
  if (error) console.error("upsertProfile:", error.message);
}

export async function deleteProfile(id) {
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) console.error("deleteProfile:", error.message);
}

// ── bin ───────────────────────────────────────────────────────────────

export async function loadBin(branchId) {
  const { data, error } = await supabase
    .from("bin")
    .select("*")
    .eq("branch_id", branchId)
    .order("deleted_at", { ascending: false });
  if (error) { console.error("loadBin:", error.message); return null; }
  return data.map(row => ({
    ...row.order_data,
    deletedAt: row.deleted_at?.split("T")[0] ?? "",
  }));
}

export async function addToBin(order, branchId) {
  const { error } = await supabase.from("bin").insert({
    id:         order.id,
    branch_id:  branchId,
    order_data: order,
    deleted_at: new Date().toISOString(),
  });
  if (error) console.error("addToBin:", error.message);
}

export async function removeFromBin(orderId) {
  const { error } = await supabase.from("bin").delete().eq("id", orderId);
  if (error) console.error("removeFromBin:", error.message);
}

export async function clearBin(branchId) {
  const { error } = await supabase.from("bin").delete().eq("branch_id", branchId);
  if (error) console.error("clearBin:", error.message);
}

// ── fabric photo upload ───────────────────────────────────────────────

export async function uploadFabricPhoto(file, orderId, branchId) {
  const ext  = file.name.split(".").pop() || "jpg";
  const path = `${branchId}/${orderId}.${ext}`;
  const { error } = await supabase.storage
    .from("fabric-photos")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) { console.error("uploadFabricPhoto:", error.message); return null; }
  const { data } = supabase.storage.from("fabric-photos").getPublicUrl(path);
  return data.publicUrl;
}

// ── expenses ──────────────────────────────────────────────────────────

function expenseFromDb(row) {
  return {
    id:          row.id,
    description: row.description ?? "",
    amount:      row.amount      ?? "0",
    currency:    row.currency    ?? "IQD",
    category:    row.category    ?? "",
    date:        row.date        ?? "",
  };
}

function expenseToDb(expense, branchId) {
  return {
    id:          expense.id,
    branch_id:   branchId,
    description: expense.description,
    amount:      expense.amount,
    currency:    expense.currency  ?? "IQD",
    category:    expense.category  ?? "",
    date:        expense.date,
  };
}

export async function loadExpenses(branchId) {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("branch_id", branchId)
    .order("date", { ascending: false });
  if (error) { console.error("loadExpenses:", error.message); return null; }
  return data.map(expenseFromDb);
}

export async function upsertExpense(expense, branchId) {
  const { error } = await supabase
    .from("expenses")
    .upsert(expenseToDb(expense, branchId), { onConflict: "id" });
  if (error) console.error("upsertExpense:", error.message);
}

export async function deleteExpense(id) {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) console.error("deleteExpense:", error.message);
}
