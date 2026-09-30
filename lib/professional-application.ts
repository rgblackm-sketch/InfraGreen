export type ProfessionalAcknowledgements = {
  informationAccurate: boolean;
  networkAcceptance: boolean;
  additionalInfoRequest: boolean;
};

export type ProfessionalApplication = {
  businessName: string;
  contactFirstName: string;
  contactLastName: string;
  email: string;
  phone: string;
  website: string;
  businessType: string;
  yearsInBusiness: string;
  businessDescription: string;
  services: string[];
  otherServices: string;
  licenses: string;
  certifications: string;
  insuranceStatus: string;
  portfolioUrls: string[];
  projectExperience: string;
  professionalReferences: string;
  serviceAreas: string[];
  zipCodes: string;
  propertyTypes: string[];
  projectSizes: string[];
  availability: string;
  additionalInformation: string;
  acknowledgements: ProfessionalAcknowledgements;
  applicationStatus: "pending";
};

export type ProfessionalApplicationReceipt = {
  referenceNumber: string;
  persistence: "local-only";
};

export function createDevelopmentApplicationReceipt(
  application: ProfessionalApplication,
): ProfessionalApplicationReceipt {
  void application;
  const reference = Math.floor(Math.random() * 9000) + 1000;
  return {
    referenceNumber: `IG-PRO-${new Date().getFullYear()}-${reference}`,
    persistence: "local-only",
  };
}