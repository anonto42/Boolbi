import bcrypt from "bcryptjs";

const Hash = async ( input: string | number ) => {
    return await bcrypt.hash( input.toString(), process.env. BCRYPT_SALT_ROUNDS! )
}

const compare = async ( plain: string | number, hashed: string ) => {
    return await bcrypt.compare( plain.toString(), hashed ); 
}

export const bcryptjs = {
    Hash,
    compare
}