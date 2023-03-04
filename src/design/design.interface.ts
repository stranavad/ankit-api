import { Prisma } from "@prisma/client";

export interface Design {
    font: string | null;
    logoUrl: string | null;
    logoPlacement: string | null;
    backgroundColor: string | null;
    backgroundImage: string | null;
    optionSelectedColor: string | null;
    optionColor: string | null;
    buttonColor: string | null;
    buttonTextColor: string | null;
    textColor: string | null;
}

export const selectDesign = Prisma.validator<Prisma.QuestionnaireDesignSelect>()({
    font: true,
    logoUrl: true,
    logoPlacement: true,
    backgroundColor: true,
    backgroundImage: true,
    buttonColor: true,
    buttonTextColor: true,
    textColor: true,
    optionSelectedColor: true,
    optionColor: true,
})