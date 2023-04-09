import { Prisma } from '@prisma/client';

export interface Design {
  font: string | null;
  logoUrl: string | null;
  logoPlacement: string | null;
  backgroundColor: string | null;
  backgroundImage: string | null;
  optionSelectedColor: string | null;
  optionSelectedText: string | null;
  optionColor: string | null;
  optionText: string | null;
  buttonColor: string | null;
  buttonText: string | null;
  textColor: string | null;
}

export const getDesignFromQuestionnaire = (questionnaire: Design & {[key: string]: any}): Design => {
  const {
    font,
    logoUrl,
    logoPlacement,
    backgroundColor,
    backgroundImage,
    optionSelectedColor,
    optionSelectedText,
    optionColor,
    optionText,
    buttonColor,
    buttonText,
    textColor,
  } = questionnaire;
  return {
    font,
    logoUrl,
    logoPlacement,
    backgroundColor,
    backgroundImage,
    optionSelectedColor,
    optionSelectedText,
    optionColor,
    optionText,
    buttonColor,
    buttonText,
    textColor,
  }
}

export const selectDesign = Prisma.validator<Prisma.QuestionnaireSelect>()({
  font: true,
  logoUrl: true,
  logoPlacement: true,
  backgroundColor: true,
  backgroundImage: true,
  optionSelectedColor: true,
  optionSelectedText: true,
  optionColor: true,
  optionText: true,
  buttonColor: true,
  buttonText: true,
  textColor: true,
});
