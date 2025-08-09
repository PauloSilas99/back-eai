import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Método para inserir dados em uma tabela
  async insert(table: string, data: any) {
    const { data: result, error } = await this.supabase
      .from(table)
      .insert(data)
      .select();

    if (error) {
      throw new Error(`Erro ao inserir dados: ${error.message}`);
    }

    return result;
  }

  // Método para buscar dados de uma tabela
  async select(table: string, query?: any) {
    let queryBuilder = this.supabase.from(table).select('*');

    if (query) {
      Object.keys(query).forEach(key => {
        queryBuilder = queryBuilder.eq(key, query[key]);
      });
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error(`Erro ao buscar dados: ${error.message}`);
    }

    return data;
  }

  // Método para atualizar dados
  async update(table: string, data: any, conditions: any) {
    let queryBuilder = this.supabase.from(table).update(data);

    Object.keys(conditions).forEach(key => {
      queryBuilder = queryBuilder.eq(key, conditions[key]);
    });

    const { data: result, error } = await queryBuilder.select();

    if (error) {
      throw new Error(`Erro ao atualizar dados: ${error.message}`);
    }

    return result;
  }

  // Método para deletar dados
  async delete(table: string, conditions: any) {
    let queryBuilder = this.supabase.from(table).delete();

    Object.keys(conditions).forEach(key => {
      queryBuilder = queryBuilder.eq(key, conditions[key]);
    });

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error(`Erro ao deletar dados: ${error.message}`);
    }

    return data;
  }
} 