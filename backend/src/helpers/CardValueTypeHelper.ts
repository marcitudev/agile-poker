import { CardValueType } from "../models/enums/CardValueType";

export class CardValueTypeHelper{
    static getOrdinal(index: number | string): number{
        if(typeof(index) === 'string'){
            return CardValueType[index as keyof typeof CardValueType];
        }

        return this.getEnumByNumberIndex(index);
    }
    
    static getEnumByNumberIndex(index: number): CardValueType{
        const enumArray = [
            CardValueType.SEQUENTIAL,
            CardValueType.FIBONACCI,
            CardValueType.CUSTOM
        ];
    
        return index in enumArray ? enumArray[index] : CardValueType.SEQUENTIAL;
    }
}