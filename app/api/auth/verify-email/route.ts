import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { emailService } from '../../../../lib/email-service'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { correo } = await request.json()
    console.log('Solicitud de verificación recibida para:', correo)

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

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Generar token de verificación
    const verificationToken = uuidv4()
    const tokenExpiry = new Date(Date.now() + 86400000) // 24 horas de validez

    try {
      // Guardar token en la base de datos
      await prisma.usuario.update({
        where: { id_usuario: user.id_usuario },
        data: {
          verification_token: verificationToken,
          verification_token_expiry: tokenExpiry
        }
      })
      console.log('Token de verificación guardado en la base de datos')

      // Enviar email de verificación
      await emailService.sendVerificationEmail(correo, verificationToken)
      console.log('Email de verificación enviado exitosamente')

      return NextResponse.json({
        message: 'Se ha enviado un correo de verificación a tu dirección de email.'
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

export async function PUT(request: Request) {
  try {
    const { token } = await request.json()
    console.log('Verificando token:', token)

    if (!token) {
      return NextResponse.json(
        { error: 'Token de verificación requerido' },
        { status: 400 }
      )
    }

    // Buscar usuario con token válido
    const user = await prisma.usuario.findFirst({
      where: {
        verification_token: token,
        verification_token_expiry: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      )
    }

    // Actualizar estado de verificación
    await prisma.usuario.update({
      where: { id_usuario: user.id_usuario },
      data: {
        email_verified: true,
        verification_token: null,
        verification_token_expiry: null
      }
    })

    return NextResponse.json({
      message: 'Email verificado exitosamente'
    })
  } catch (error) {
    console.error('Error al verificar email:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 