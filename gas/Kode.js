// --- 1. SETUP AWAL ---
function setupInitial() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Setup Sheet Links
  var sheet = ss.getSheetByName("Links") || ss.insertSheet("Links");
  sheet.clear();
  sheet.getRange(1, 1, 1, 4).setValues([["slug", "target", "clicks", "created_at"]]).setFontWeight("bold");
  
  // Setup Sheet Creds
  var credsSheet = ss.getSheetByName("Creds") || ss.insertSheet("Creds");
  credsSheet.clear();
  credsSheet.getRange(1, 1, 1, 2).setValues([["username", "password"]]).setFontWeight("bold");
  credsSheet.getRange(2, 1, 1, 2).setValues([["admin", "rahasia123"]]);
  
  console.log("Setup Berhasil! Jalankan 'Deploy' sekarang.");
}

// --- 2. HEADER CORS ---
function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Helper: return a small HTML page that immediately redirects the client.
function responseRedirect(target) {
  var safe = String(target).replace(/"/g, '\\"');
  var html = '<!doctype html><html><head>'
    + '<meta http-equiv="refresh" content="0;url=" + safe + '" />'
    + '<script>location.replace("' + safe + '");</script>'
    + '</head><body></body></html>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// --- 3. HANDLER OPTIONS (Preflight) ---
function doOptions(e) {
  return responseJSON({status: "success"});
}

// --- 4. HANDLER GET (Read & Redirect) ---
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Links");
  var action = e.parameter.action;

  // Logika Redirect (?id=slug)
  if (e.parameter.id) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == e.parameter.id) {
        sheet.getRange(i + 1, 3).setValue((data[i][2] || 0) + 1);
        return responseRedirect(data[i][1]);
      }
    }
    return responseJSON({ status: "error", message: "Not Found" });
  }

  // Logika Read Data (?action=read)
  if (action == "read") {
    var data = sheet.getDataRange().getValues();
    var rows = [];
    for (var i = 1; i < data.length; i++) {
      rows.push({ slug: data[i][0], target: data[i][1], clicks: data[i][2], date: data[i][3] });
    }
    return responseJSON(rows);
  }
  return responseJSON({status: "API Active"});
}

// --- 5. HANDLER POST (Login & Add) ---
function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var params = JSON.parse(e.postData.contents);

  // Logika Login
  if (params.action == "login") {
    var creds = ss.getSheetByName("Creds").getDataRange().getValues();
    if (params.user == creds[1][0] && params.pass == creds[1][1]) {
      return responseJSON({ status: "success", token: btoa(params.user + ":" + params.pass) });
    }
    return responseJSON({ status: "error", message: "Wrong credentials" });
  }

  // Logika Tambah Link
  if (params.action == "add") {
    var sheet = ss.getSheetByName("Links");
    if (!params.slug || !params.target) return responseJSON({ status: "error", message: "Missing slug or target" });
    // check uniqueness
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == params.slug) return responseJSON({ status: "error", message: "Slug already exists" });
    }
    sheet.appendRow([params.slug, params.target, 0, new Date()]);
    return responseJSON({ status: "success" });
  }
}