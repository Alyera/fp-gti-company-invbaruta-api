import { Injectable } from '@nestjs/common';
import { CreateClientInput } from './dto/create-client.input';
import { UpdateClientInput } from './dto/update-client.input';
import { PrismaService } from 'src/prisma/prisma.service';



@Injectable()
export class ClientsService {
  clientInvoicesByRIF(CUSTNMBR: string) {
    throw new Error('Method not implemented.');
  }

  constructor (private prisma: PrismaService) {}

  create(createClientInput: CreateClientInput) {
    return 'This action adds a new client';
  }

  findAll(PAGE: number) {
    const page = PAGE;
    return this.prisma.client.findMany({
      skip: (page - 1) * 100,
      take: 100,
      select: {
        CUSTNMBR: true,
        CUSTNAME: true,
        PHONE1: true,
        STATE: true,
        email:{
          select:{
            Email_Recipient: true
          }
        } 
      },
    });
  }

  findOne(CUSTNMBR: string) {
    return this.prisma.client.findUnique({where: { CUSTNMBR }});
  }

  update(id: number, updateClientInput: UpdateClientInput) {
    return `This action updates a #${id} client`;
  }

  remove(id: number) {
    return `This action removes a #${id} client`;
  }

  clientAccountsByRIF(CUSTNMBR: string) {
    return this.prisma.client.findUnique({
      where: { CUSTNMBR },
      include: {
        accounts: {
          select: {
            CUSTNMBR: true,
             
          },
          where: {
            CUSTNMBR: CUSTNMBR
          }
        }
        
        /*email: {
          select: {
          },
          where: {
            CUSTNMBR: CUSTNMBR
          }
        },
        documents:{
          select: {
            SOPNUMBE: true,
            PRSTADCD:true,
            SUBTOTAL:true,
            ORSUBTOT:true,

          },
          where: {
            CUSTNMBR: CUSTNMBR
          }
        }*/
      }
    });
  }

  async clientProformasByRIF(CUSTNMBR: string, PAGE: number, FILTERYEAR?: number, FILTERMONTH?: number) {
    const page = PAGE;
  
    const adjustedMonth = 
    FILTERMONTH && FILTERMONTH >= 1 && FILTERMONTH <= 12 ? FILTERMONTH - 1 : undefined;
  
    const dateStart = FILTERYEAR
      ? adjustedMonth !== undefined
        ? new Date(FILTERYEAR, adjustedMonth-1, 1) 
        : new Date(FILTERYEAR, 0-1, 1) 
      : undefined;
  
    const dateEnd = FILTERYEAR
      ? adjustedMonth !== undefined
        ? new Date(FILTERYEAR, adjustedMonth + 1, 1) 
        : new Date(FILTERYEAR, 11, 1) 
      : undefined;
  
    return this.prisma.client.findUnique({
      where: { CUSTNMBR },
      select: {
        CUSTNMBR: true,
        proformas: {
          orderBy: [
            { DOCDATE: 'asc' },
            { SOPNUMBE: 'asc' },
          ],
          skip: (page - 1) * 100,
          take: 100,
          select: {
            SOPNUMBE: true,
            PRSTADCD: true,
            SUBTOTAL: true,
            ORSUBTOT: true,
            TAXAMNT: true,
            ORTAXAMT: true,
            DOCAMNT: true,
            ORDOCAMT: true,
            DOCDATE: true,
            CURNCYID: true,
            CREATDDT: true,
            sales_taxes_work_history: {
              select: {
                TXDTLPCTAMT: true,
              },
              where: {
                LNITMSEQ: 0,
              },
            },
            work_history: {
              select: {
                USRDAT02: true,
                COMMENT_1: true,
                USRDEF03: true,
              },
              where: {
                SOPTYPE: 2,
                ...(dateStart && dateEnd
                  ? {
                      USRDAT02: {
                        gte: dateStart,
                        lt: dateEnd,
                      },
                    }
                  : {}),
              },
            },
            khistory: {
              where: {
                SOPTYPE: 2,
                DELETE1: 0,
              },
            },
            detail: {
              where: {
                SOPTYPE: 2,
              },
            },
          },
          where: {
            CUSTNMBR,
            SOPTYPE: 2,
            VOIDSTTS: 0,
            ...(dateStart && dateEnd
              ? {
                  OR: [
                    {
                      DOCDATE: {
                        gte: dateStart,
                        lt: dateEnd,
                      },
                    },
                    {
                      work_history: {
                        some: {
                          USRDAT02: {
                            gte: dateStart,
                            lt: dateEnd,
                          },
                        },
                      },
                    },
                  ],
                }
              : {}),
            khistory: {
              every: {
                NOT: {
                  DELETE1: 0,
                  SOPTYPE: 2,
                },
              },
            },
          },
        },
      },
    });
  }


  async countProformasByRIF(CUSTNMBR: string) {
    const client = await this.prisma.client.findUnique({
      where: { CUSTNMBR },
      select: {
        CUSTNMBR: true,
        proformas: {
          select: {
            SOPNUMBE: true, 
          },
          where: {
            CUSTNMBR: CUSTNMBR,
            SOPTYPE: 2,
            VOIDSTTS:0,
            khistory: {
              every: {
                NOT: {
                  DELETE1: 0,
                  SOPTYPE:2,
                },
              },
            },
          },
        },
      },
    });
  
    if (!client) return null;
    //console.log(client.proformas.length)
    return {
      CUSTNMBR: client.CUSTNMBR,
      proformasCount: client.proformas.length,
    };
  }

  clientProformasFluent(CUSTNMBR: string) {
    return this.prisma.client.findUnique({
      where: {CUSTNMBR:CUSTNMBR}})
    
    .proformas({
      select:{
        CUSTNMBR:true
      }
    })
  }

  findAllByRif(CUSTNMBR: string) {
    return this.prisma.client.findMany({
      where: { CUSTNMBR },
      select: {
        CUSTNMBR: true,
        CUSTNAME: true,
        PHONE1: true,
        STATE: true,
        email:{
          select:{
            Email_Recipient: true
          }
        } 
      },
    });
  }
}
