import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

async function hasPassword(password) {
    return await bcrypt.hash(password, 10)
}

async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hasPassword)
}