import bcrypt from 'bcrypt'

export async function hash_password(password) {
    const hash = await bcrypt.hash(password, 10)
    return hash
}