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
};