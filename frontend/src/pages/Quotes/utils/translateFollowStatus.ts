
export const translateFollowStatus = (status: string) => {

    switch(status){
        case "IN_PROGRESS":
            return "EN PROGRESO";
        case "PAUSED":
            return "EN PAUSA";
        case "SUBMITTED":    
            return "ENVIADO";
        case "COMPLETED":
            return "COMPLETADA";
        case "CANCELLED":
            return "CANCELADA";
        case "APPROVED":
            return "APROBADA";
        case "REJECTED":
            return "RECHAZADA"               
    }  

}