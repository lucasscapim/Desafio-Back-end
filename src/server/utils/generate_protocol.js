import { customAlphabet } from 'nanoid';
import prisma from '../prisma.js';

// Define o alfabeto (semelhante ao base36, mas removendo letras confusas)
const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8); 

export async function generateReadableProtocol(prefix = 'TRF') {
  let unique = false;
  let protocol = '';

  while (!unique) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // Ex: 20250505
    const random = nanoid(); // Ex: 7FA2B3X9

    protocol = `${prefix}-${date}-${random}`; // Ex: TRF-20250505-7FA2B3X9

    const exists = await prisma.log.findUnique({
      where: {
        transaction_id: protocol, 
      },
    });

    if (!exists) {
      unique = true;
    }
  }

  return protocol;
}