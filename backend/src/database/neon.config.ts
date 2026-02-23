import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

// La chaîne de connexion Neon ressemble à :
// postgresql://user:password@ep-xxx.eu-west-2.aws.neon.tech/crmdb?sslmode=require
const sql = neon(process.env.DATABASE_URL!)

export const db = drizzle(sql)
export { sql }