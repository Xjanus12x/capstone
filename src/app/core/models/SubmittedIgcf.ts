export interface ISubmittedIGCF {
  accomplishment_percentages: string;
  commitments: string;
  emp_dept: string;
  emp_number: string;
  emp_position: string;
  equivalent_description?: string;
  equivalent_ratings?: string;
  fullname: string;
  id: number;
  igc_percentages: string;
  overall_weighted_average_rating?: string;
  ratee_fullname: string;
  ratee_date_signed: string;
  ratee_signature: string;
  rater_date_signed?: string;
  rater_signature?: string;
  selected_commitment_percentages: string;
  selected_igc_percentages: string;
  selected_weight_percentages: string;
  top_three_competencies_improvement: string;
  top_three_competency_strenghts: string;
  top_three_highly_agc: string;
  top_three_least_agc: string;
  top_three_training_development_suggestions: string;
  weight_percentages: string;
  isSigned: boolean;
}
