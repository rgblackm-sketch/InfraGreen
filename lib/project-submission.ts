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
  persistence: "local-only";
};

export function createLocalProjectReceipt(project: ProjectSubmissionData): ProjectSubmissionReceipt {
  void project;
  const reference = Math.floor(Math.random() * 9000) + 1000;
  return {
    referenceNumber: `IG-${new Date().getFullYear()}-${reference}`,
    persistence: "local-only",
  };
}