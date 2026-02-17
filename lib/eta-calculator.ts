import { ETACalculationParams, ETAResult } from '@/types'

/**
 * Calculate Estimated Time of Arrival (ETA) for food delivery
 * Version 1: Simple calculation based on prep time, distance, and current orders
 */
export function calculateETA(params: ETACalculationParams): ETAResult {
    const { restaurantAvgPrepTime, distanceKm, currentOrders } = params

    // Add 3 minutes per order currently in queue
    const queueDelay = currentOrders * 3

    // Total prep time = average + queue delay
    const prepTime = restaurantAvgPrepTime + queueDelay

    // Amman traffic average: 4 minutes per km
    // TODO: Make this dynamic based on time of day
    const drivingTime = Math.ceil(distanceKm * 4)

    const totalMinutes = prepTime + drivingTime

    // Calculate estimated delivery time
    const estimatedDeliveryTime = new Date()
    estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + totalMinutes)

    return {
        totalMinutes,
        estimatedDeliveryTime,
        breakdown: {
            prep: prepTime,
            driving: drivingTime,
        },
    }
}

/**
 * Calculate distance between two points (simplified version)
 * TODO: Replace with Google Maps Distance Matrix API
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371 // Earth's radius in km
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return distance
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180)
}
