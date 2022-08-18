import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/service/prisma.service';
import { handleError } from 'src/utils/handle-error.util';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@Injectable()
export class InstitutionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInstitutionDto: CreateInstitutionDto) {
    const data: Prisma.InstitutionCreateInput = {
      name: createInstitutionDto.name,
      phone_number: createInstitutionDto.phone_number,
      address: {
        connect: {
          id: createInstitutionDto.address_id,
        },
      },
    };

    return await this.prisma.institution
      .create({
        data,
        select: {
          id: true,
          name: true,
          address: {
            select: {
              city: true,
              state: true,
            },
          },
        },
      })
      .catch(handleError);
  }

  async findAll() {
    const allInstitutions = await this.prisma.institution
      .findMany({
        select: {
          id: true,
          name: true,
          address: {
            select: {
              city: true,
              state: true,
            },
          },
          deleted_at: true
        },
      })
      .catch(handleError);

    if (allInstitutions.length === 0) {
      throw new NotFoundException('No a Institutions found');
    }

    return allInstitutions;
  }

  async findOne(institutionId: number) {
    const record = await this.prisma.institution
      .findUnique({
        where: { id: institutionId },
        select: {
          id: true,
          name: true,
          phone_number: true,
          address: {
            select: {
              id: true,
              city: true,
              state: true,
              neighborhood: true,
            },
          },
          deleted_at: true
        },
      })
      .catch(handleError);

    if (!record) {
      throw new NotFoundException(
        `Record with Id '${institutionId}' not found!`,
      );
    }

    return record;
  }

  async update(institutionId: number, updateInstitutionDto: UpdateInstitutionDto) {
    await this.findOne(institutionId);
    const data = { ...updateInstitutionDto };

    return await this.prisma.institution
      .update({
        where: { id: institutionId },
        data
      })
      .catch(handleError);
  }

  async delete(institutionId: number) {
    await this.findOne(institutionId);
    await this.prisma.institution
      .update({
        where: { id: institutionId },
        data: {
          deleted_at: new Date()
        },
      })
      .catch(handleError);
  }
}
