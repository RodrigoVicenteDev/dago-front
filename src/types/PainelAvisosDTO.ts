export interface PainelAvisosDTO {
  ctrcsParadosGRU: CtrcParadoDTO[];
  ctrcsParadosUND: CtrcParadoDTO[];
  ctrcsAtrasadas: CtrcAtrasadaDTO[];
  ctrcsVaiAtrasar: CtrcVaiAtrasarDTO[];
}

// 💼 CTRCs parados em GRU ou em Unidade (UND) — mesmo formato
export interface CtrcParadoDTO {
  id: number;                // Id da ocorrência / linha da view
  ctrcId: number;           // Id do CTRC na tabela Ctrcs
  numero : number;         // numero do CTRC
  data: string;              // Data da ocorrência (ISO string)
  clienteId: number;  
  unidadeId : number       // Id do cliente
  numeroNotaFiscal: string;  // Número da NF
  cliente: string;              // Nome do cliente
  descricao: string;         // Texto da ocorrência / descrição
  quantidade: number;        // Quantidade de notas / volumes, etc.
}

// ⏰ CTRCs já atrasados
export interface CtrcAtrasadaDTO {
  numero: string;                     // Número do CTRC (ex: GRU395751-9)
  destinatario: string;               // Nome do destinatário
  numeroNotaFiscal: string;           // NF
  cidadeDestino: string;              // Nome da cidade de destino
  estadoDestino: string;              // Sigla do estado (UF)
  cliente: string;
  unidadeId : number
  clienteId : number;                    
  diasAtraso: number;                 // Quantos dias de atraso
  ultimaOcorrenciaAtendimento: string | null; // Última ocorrência de atendimento (se tiver)
}

// ⚠️ CTRCs que ainda vão atrasar (projeção)
export interface CtrcVaiAtrasarDTO {
  numero: string;             // Número do CTRC
  destinatario: string;       // Nome do destinatário
  numeroNotaFiscal: string;   // NF
  cidadeDestinoId: number;    // Id da cidade de destino
  estadoDestinoId: number;    // Id do estado de destino
  unidadeId : number
  clienteId : number;
  nome: string;               // Nome do cliente
}