import { privateKeyToAccount, generatePrivateKey } from "viem/accounts"

const pk = generatePrivateKey()
const account = privateKeyToAccount(pk)
console.log(JSON.stringify({ address: account.address, privateKey: pk }, null, 2))
