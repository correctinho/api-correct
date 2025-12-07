// Item individual da lista
export interface ScheduledRequestItemDto {
    request_uuid: string;

    customer: {
        uuid: string;
        name: string;
    };

    service: {
        uuid: string;
        name: string;
    };

    scheduled_datetime: string;
}

// O objeto de retorno da API
export interface OutputListProviderScheduledRequestsDto {
    requests: ScheduledRequestItemDto[];
}