import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email deve ser um email válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  @MaxLength(100, { message: 'Senha deve ter no máximo 100 caracteres' })
  password?: string;
} 