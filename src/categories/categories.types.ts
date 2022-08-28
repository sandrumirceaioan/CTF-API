import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateCategoryDto {
    @ApiProperty({ example: 'category-name' })
    @IsNotEmpty()
    @IsString()
    readonly url: string;
   
    @ApiProperty({ example: 'Category Name' })
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @ApiProperty({ example: 'Short category description...' })
    @IsNotEmpty()
    @IsString()
    readonly summary: string;

    @ApiProperty({ example: 'Category longer description...' })
    @IsNotEmpty()
    @IsString()
    readonly description: string;
    
    @ApiProperty({ example: 'thumbnail-example.jpg' })
    @IsString()
    readonly thumbnail: string;
  
    @ApiProperty({ example: 'banner-example.png' })
    @IsString()
    readonly banner: string;
  
    @ApiProperty({ example: 'f446743z356er6v533d812' })
    @IsNotEmpty()
    @IsString()
    readonly parent: string;
}