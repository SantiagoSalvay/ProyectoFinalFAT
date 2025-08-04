import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { emailService } from '@/lib/email-service'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { correo } = await request.json()
    console.log('Solicitud de reset recibida para:', correo)

    if (!correo) {
      return NextResponse.json(
        { error: 'El correo es requerido' },
        { status: 400 }
      )
    }

    // Verificar si el usuario existe
    const user = await prisma.usuario.findFirst({
      where: { correo }
    })

    console.log('Usuario encontrado:', user ? 'Sí' : 'No')

    if (!user) {
      // Por seguridad, no revelamos si el correo existe o no
      return NextResponse.json({
        message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.'
      })
    }

    // Generar token único
    const resetToken = uuidv4()
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora de validez

    try {
      // Guardar token en la base de datos
      await prisma.usuario.update({
        where: { id_usuario: user.id_usuario },
        data: {
          reset_token: resetToken,
          reset_token_expiry: resetTokenExpiry
        }
      })
      console.log('Token guardado en la base de datos')

      // Enviar email usando el servicio
      await emailService.sendPasswordResetEmail(correo, resetToken)
      console.log('Email enviado exitosamente')

      return NextResponse.json({
        message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.'
      })
    } catch (error) {
      console.error('Error en el proceso:', error)
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 