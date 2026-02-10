
export interface UserStats {
    balance: number;
    referrals: number;
    plan: string;
    status: 'ACTIVE' | 'PENDING' | 'EXPIRED';
}

export interface PanelTool {
    id: string;
    name: string;
    status: 'STABLE' | 'UPDATING' | 'OFFLINE';
    lastUpdate: string;
}

export interface ElitePanelData {
    user: UserStats;
    tools: PanelTool[];
}
