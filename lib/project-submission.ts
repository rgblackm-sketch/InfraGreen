export type ProjectSubmissionData = {
  stormwaterProblems: string[];
  problemDescription: string;
  propertyType: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  problemDuration: string;
  afterRainDescription: string;
  photos: File[];
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  budget: string;
  acknowledgement: boolean;
};

export type ProjectSubmissionReceipt = {
  referenceNumber: string;
};