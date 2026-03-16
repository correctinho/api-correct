
export interface OutputGetAvailableMembersDTO {
    members: {
        uuid: string;
        name: string;
        function: string | null;
        current_group: {
            uuid: string;
            name: string;
        } | null;
    }[]
}