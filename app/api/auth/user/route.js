// app/api/auth/user/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';

// In-memory cache for user data (use Redis in production for multiple servers)
const userCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Cache cleanup to prevent memory bloat
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of userCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
            userCache.delete(key);
        }
    }
}, 60000); // Clean every minute

export async function GET() {
    try {
        // Fix: Await cookies() before using get()
        const cookieStore = await cookies();
        const userId = cookieStore.get('userId')?.value;

        if (!userId) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Check cache first - if user data exists and is fresh, return it
        const cacheKey = `user_${userId}`;
        const cachedData = userCache.get(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
            return NextResponse.json({
                success: true,
                user: cachedData.user
            });
        }

        await connectDB();

        // Find user by ID - optimized query (only fetch needed fields, use lean for speed)
        const user = await User.findById(userId)
            .select('_id name email phone companyName role profilePicture createdAt')
            .lean()
            .exec();

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Return user data (without password) - EXACT same structure as before
        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            companyName: user.companyName,
            role: user.role,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt
        };

        // Cache the user data for next requests
        userCache.set(cacheKey, {
            user: userData,
            timestamp: Date.now()
        });

        return NextResponse.json({
            success: true,
            user: userData
        });

    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Failed to get user data' },
            { status: 500 }
        );
    }
}