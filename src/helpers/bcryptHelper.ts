import bcrypt from "bcryptjs";
import config from "../config";

const Hash = async ( input: string | number ) => {
    return await bcrypt.hash( input.toString(), config.bcrypt_sart_rounds )
}

const compare = async ( plain: string | number, hashed: string ) => {
    return await bcrypt.compare( plain.toString(), hashed ); 
}

export const bcryptjs = {
    Hash,
    compare
}