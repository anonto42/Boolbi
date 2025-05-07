import bcrypt from "bcryptjs";
import config from "../config";

const Hash = async ( input: string | number ) => { 
    const saltRounds = parseInt(config.bcrypt_sart_rounds.toString(), 10);
    
    return await bcrypt.hash( input.toString(), saltRounds )
}

const compare = async ( plain: string | number, hashed: string ) => {
    return await bcrypt.compare( plain.toString(), hashed ); 
}

export const bcryptjs = {
    Hash,
    compare
}