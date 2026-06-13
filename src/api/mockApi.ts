import type { AppItem, GraphData } from '../types';

const MOCK_APPS: AppItem[] = [
  { id: '1', name: 'supertokens-golang' },
  { id: '2', name: 'supertokens-java' },
  { id: '3', name: 'supertokens-python' }
];

// Helper to generate distinct initial graphs for each app
const generateMockGraph = (appId: string): GraphData => {
  switch (appId) {
    case '1':
      return {
        nodes: [
          {
            id: 'go-api',
            type: 'service',
            position: { x: 50, y: 100 },
            data: {
              name: 'supertokens-golang-api',
              status: 'healthy',
              value: 2,
              description: 'Primary Go backend service handling session verification and authentication API endpoints.'
            }
          },
          {
            id: 'postgres',
            type: 'service',
            position: { x: 450, y: 80 },
            data: {
              name: 'Postgres',
              status: 'healthy',
              value: 2,
              description: 'Primary relational database for storing user accounts, metadata, and token secrets.'
            }
          },
          {
            id: 'redis',
            type: 'service',
            position: { x: 200, y: 320 },
            data: {
              name: 'Redis',
              status: 'down',
              value: 2,
              description: 'In-memory database used for caching active session tokens to optimize read performance.'
            }
          },
          {
            id: 'mongodb',
            type: 'service',
            position: { x: 550, y: 350 },
            data: {
              name: 'Mongodb',
              status: 'down',
              value: 2,
              description: 'Document database housing flexible schema configuration and user settings.'
            }
          }
        ],
        edges: [
          { id: 'e-go-postgres', source: 'go-api', target: 'postgres', animated: true },
          { id: 'e-go-redis', source: 'go-api', target: 'redis', animated: true },
          { id: 'e-go-mongodb', source: 'go-api', target: 'mongodb', animated: true }
        ]
      };
    case '2':
      return {
        nodes: [
          {
            id: 'java-auth',
            type: 'service',
            position: { x: 100, y: 150 },
            data: {
              name: 'supertokens-java-auth',
              status: 'healthy',
              value: 90,
              description: 'Java Core service implementing the OAuth2 and OpenID Connect specifications.'
            }
          },
          {
            id: 'mongodb',
            type: 'service',
            position: { x: 400, y: 100 },
            data: {
              name: 'MongoDB Atlas',
              status: 'healthy',
              value: 45,
              description: 'Document database housing flexible schema configuration and user settings.'
            }
          },
          {
            id: 'rabbitmq',
            type: 'service',
            position: { x: 400, y: 300 },
            data: {
              name: 'RabbitMQ Broker',
              status: 'down',
              value: 0,
              description: 'Message broker for asynchronous event delivery and registration email processing.'
            }
          }
        ],
        edges: [
          { id: 'e-java-mongodb', source: 'java-auth', target: 'mongodb', animated: true },
          { id: 'e-java-rabbitmq', source: 'java-auth', target: 'rabbitmq', animated: true }
        ]
      };
    case '3':
      return {
        nodes: [
          {
            id: 'fastapi-auth',
            type: 'service',
            position: { x: 200, y: 100 },
            data: {
              name: 'supertokens-python-fastapi',
              status: 'healthy',
              value: 75,
              description: 'High-performance Python/FastAPI async auth microservice.'
            }
          },
          {
            id: 'postgres-replica',
            type: 'service',
            position: { x: 500, y: 50 },
            data: {
              name: 'Postgres Read Replica',
              status: 'healthy',
              value: 50,
              description: 'Read-only replica for analytics queries and user lookups.'
            }
          },
          {
            id: 'memcached',
            type: 'service',
            position: { x: 500, y: 250 },
            data: {
              name: 'Memcached Cluster',
              status: 'degraded',
              value: 12,
              description: 'Distributed memory caching system to alleviate read spikes on the replica database.'
            }
          }
        ],
        edges: [
          { id: 'e-py-postgres', source: 'fastapi-auth', target: 'postgres-replica', animated: true },
          { id: 'e-py-memcached', source: 'fastapi-auth', target: 'memcached', animated: true }
        ]
      };
    default:
      return { nodes: [], edges: [] };
  }
};

export const fetchApps = (): Promise<AppItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_APPS]);
    }, 600); // 600ms latency simulation
  });
};

export const fetchGraph = (appId: string): Promise<GraphData> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!MOCK_APPS.some(app => app.id === appId)) {
        reject(new Error(`Application with ID "${appId}" not found.`));
      } else {
        // Return deep copy so updates in UI don't mutate local modules cache directly
        resolve(JSON.parse(JSON.stringify(generateMockGraph(appId))));
      }
    }, 800); // 800ms latency simulation
  });
};
