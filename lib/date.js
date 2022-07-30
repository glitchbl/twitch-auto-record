import { format } from 'date-fns'

export function getDateString() {
    return format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
}
