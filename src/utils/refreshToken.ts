import axios from 'axios';

interface RefreshTokenResponse {
    accessToken: string;
    [key: string]: unknown;
}

interface RefreshTokenResult {
    success: boolean;
    data: {
        token: string;
    };
    message: string;
}

export default async function refreshToken(): Promise<RefreshTokenResult> {
    const tokenUrl = 'https://ig.gov-cloud.ai/mobius-iam-service/v1.0/login';

    const requestBody = {
        userName: 'ksamxp@mobiusdtaas.ai',
        password: 'Gaian@123',
        productId: 'c2255be4-ddf6-449e-a1e0-b4f7f9a2b636',
        requestType: 'TENANT'
    };

    try {
        const { data } = await axios.post<RefreshTokenResponse>(tokenUrl, requestBody);

        return {
            success: true,
            data: {
                token: data.accessToken
            },
            message: 'Token generation successful!'
        };
    } catch (error: any) {
        return {
            success: false,
            data: {
                token: ''
            },
            message: error?.response?.data?.message || 'Token generation failed!'
        };
    }
}
