export interface SendCompanyForgotPasswordMailDTO {
    email: string;
    portal: 'employer' | 'partner';
}