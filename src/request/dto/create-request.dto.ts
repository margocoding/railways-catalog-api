import { IsString, IsOptional, IsEmail, IsBoolean, Equals, Matches } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  name!: string;
  
  @IsString()
  @Matches(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, {
    message: 'Телефон должен быть в формате +7 (XXX) XXX-XX-XX',
  })
  phone!: string;
  
  @IsOptional()
  @IsEmail()
  email?: string;
  
  @IsOptional()
  @IsString()
  comment?: string;
  
  @IsBoolean()
  @Equals(true, { message: 'Необходимо согласие с политикой конфиденциальности' })
  policyAccepted!: boolean;
  
  @IsOptional()
  @IsString()
  serviceId?: string;
  
  @IsOptional()
  @IsString()
  productId?: string;
}