import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

let _doc: GoogleSpreadsheet | null = null;

export async function getDoc(): Promise<GoogleSpreadsheet> {
  if (_doc) return _doc;

  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const rawKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;

  if (!spreadsheetId || !clientEmail || !rawKey) {
    throw new Error("Google Sheets credentials not configured");
  }

  const privateKey = rawKey.replace(/\\n/g, "\n");

  const auth = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  _doc = new GoogleSpreadsheet(spreadsheetId, auth);
  await _doc.loadInfo();
  return _doc;
}
