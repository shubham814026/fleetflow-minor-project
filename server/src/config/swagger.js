import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SmartFleet AI Backend API Specifications',
      version: '1.0.0',
      description: 'Production API specs for SmartFleet AI Fleet, GPS Telemetry, Driver PWA & Management Platform'
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local Development Gateway'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        secondaryAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Secondary-Auth'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
