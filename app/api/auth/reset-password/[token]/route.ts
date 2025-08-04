import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { nuevaContrasena } = await request.json()
    const { token } = params

    if (!nuevaContrasena || !token) {
      return NextResponse.json(
        { error: 'La contraseña y el token son requeridos' },
        { status: 400 }
      )
    }

    // Buscar usuario con token válido
    const user = await prisma.usuario.findFirst({
      where: {
        reset_token: token,
        reset_token_expiry: {
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

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10)

    // Actualizar contraseña y limpiar token
    await prisma.usuario.update({
      where: { id_usuario: user.id_usuario },
      data: {
        contrasena: hashedPassword,
        reset_token: null,
        reset_token_expiry: null
      }
    })

    return NextResponse.json({
      message: 'Contraseña actualizada exitosamente'
    })
  } catch (error) {
    console.error('Error al resetear contraseña:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 