//uploads code to https://web3.storage/

import { Web3Storage, getFilesFromPath } from 'web3.storage'

// Construct with token and endpoint
const client = new Web3Storage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDY2OTBDRTU2MWI3OTk4Mjk0MzAxMjRBN0VlQ0JEYTEwRjJBMkU1QzMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2ODQ2ODkwMTA1MzUsIm5hbWUiOiJBU0NJSVJhZGJyb3MifQ.Ud6EWEIEe0Kx7MS5i-YoZB3KRugl_Jrw4JiiMmcwXLY" })

const fileInput = await getFilesFromPath("./output/finaljson/");

// Pack files into a CAR and send to web3.storage
const rootCid = await client.put(fileInput) // Promise<CIDString>

// Get info on the Filecoin deals that the CID is stored in
const info = await client.status(rootCid) // Promise<Status | undefined>

// Fetch and verify files from web3.storage
const res = await client.get(rootCid) // Promise<Web3Response | null>
console.log(res);
//const files = await res.files() // Promise<Web3File[]>

//for (const file of files) {
//  console.log(`${file.cid} ${file.name} ${file.size}`)
//}
