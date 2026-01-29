/**
 * Configuración de URLs de las APIs externas
 * Centraliza la configuración de las 5 APIs del sistema
 */

export const API_CONFIG = {
  /**
   * API de Tiempos Fuera (Pausas)
   * Puerto: 5004
   * Endpoints: /empleados, /pausas
   */
  TIEMPOS_FUERA: {
    BASE_URL: process.env.NEXT_PUBLIC_API_TIEMPOS_FUERA_URL,
    ENDPOINTS: {
      EMPLEADOS: '/empleados',
      PAUSAS: '/pausas',
      PAUSAS_POR_FECHA: (fecha: string) => `/pausas/fecha/${fecha}`,
      PAUSA_BY_ID: (id: number) => `/pausas/${id}`,
    },
  },

  /**
   * API de Personal (Pendiente de implementar)
   * Puerto: TBD
   */
  PERSONAL: {
    BASE_URL: process.env.NEXT_PUBLIC_API_PERSONAL_URL,
    ENDPOINTS: {
      // TODO: Definir endpoints cuando se implemente la API
    },
  },

  /**
   * API de Turnos (Pendiente de implementar)
   * Puerto: TBD
   */
  TURNOS: {
    BASE_URL: process.env.NEXT_PUBLIC_API_TURNOS_URL,
    ENDPOINTS: {
      // TODO: Definir endpoints cuando se implemente la API
    },
  },

  /**
   * API de Recesos (Pendiente de implementar)
   * Puerto: TBD
   */
  RECESOS: {
    BASE_URL: process.env.NEXT_PUBLIC_API_RECESOS_URL,
    ENDPOINTS: {
      // TODO: Definir endpoints cuando se implemente la API
    },
  },

  /**
   * API de Firmas (Pendiente de implementar)
   * Puerto: TBD
   */
  FIRMAS: {
    BASE_URL: process.env.NEXT_PUBLIC_API_FIRMAS_URL,
    ENDPOINTS: {
      // TODO: Definir endpoints cuando se implemente la API
    },
  },
};

export default API_CONFIG;
