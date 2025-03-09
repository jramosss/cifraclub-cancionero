import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function connectToSocket(id: string, onOpen?: () => void) {
    const socket = new WebSocket(`ws://localhost:8000/${id}`)

    socket.onopen = () => {
        console.log(`Connected to ${id}`)
        socket.send(JSON.stringify({ connection_id: id }))
        if (onOpen) {
            onOpen()
        }
    }
    socket.onclose = () => {
        console.log(`Disconnected from ${id}`)
    }

    socket.onerror = event => console.error('Error:', event)

    return socket
}
