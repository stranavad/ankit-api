import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RoleType } from '../role';

interface Account {
  id: number;
  userId: number;
  type: string;
  provider: string;
  providerAccountId: number;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string;
  id_token: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  image: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  @Post('/login')
  async login(@Body() body: { account: Account; user: User }) {
    const { account, user } = body;
    let userToJwt;
    const accountToUpdate = await this.prismaService.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: account.provider,
          providerAccountId: account.providerAccountId.toString(),
        },
      },
    });
    if (accountToUpdate) {
      const accountUpdated = await this.prismaService.account.update({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId.toString(), // TODO REMOVE
          },
        },
        data: {
          access_token: account.access_token,
          expires_at: account.expires_at,
          id_token: account.id_token,
        },
        select: {
          user: {
            select: {
              id: true,
            },
          },
        },
      });
      userToJwt = accountUpdated.user;
    } else {
      userToJwt = await this.prismaService.user.create({
        data: {
          name: user.name,
          email: user.email,
          image: user.image,
          accounts: {
            create: {
              provider: account.provider,
              providerAccountId: account.providerAccountId.toString(), // TODO REMOVE
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              id_token: account.id_token,
            },
          },
          // Onboarding
          members: {
            create: {
              name: 'Me',
              accepted: true,
              role: RoleType.OWNER,
              space: {
                create: {
                  name: 'Personal space',
                  personal: true,
                  description: 'This is your personal space',
                  questionnaires: {
                    create: {
                      name: 'Your first questionnaire',
                      description:
                        'This is your questionnaire, hit publish and change status to ACTIVE to start collecting your first responses',
                      questions: {
                        create: [
                          {
                            title: 'This is ordinary free text question',
                            description:
                              'User is allowed to enter anything he wants',
                            position: 10,
                          },
                          {
                            title: 'This is multiselect question',
                            description:
                              'User is allowed to select as many options as he wants',
                            type: 'MULTI_SELECT',
                            position: 20,
                            options: {
                              create: [
                                {
                                  position: 10,
                                  value: 'First option',
                                },
                                {
                                  position: 20,
                                  value: 'Second option',
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        select: {
          id: true,
        },
      });
    }
    const accessToken = this.jwtService.sign(userToJwt);

    return { token: accessToken };
  }
}
