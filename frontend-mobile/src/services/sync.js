import * as Network from 'expo-network';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getDB } from '../database/db';

const API_URL = 'http://192.168.1.45:8000/api'; // CHANGE TO YOUR LOCAL IP

export const syncData = async () => {
    const networkState = await Network.getNetworkStateAsync();
    if (!networkState.isConnected || !networkState.isInternetReachable) {
        console.log("No internet connection. Skipping sync.");
        return;
    }

    const token = await SecureStore.getItemAsync('userToken');
    if (!token) {
        console.log("No auth token found. Skipping sync.");
        return;
    }

    const db = getDB();

    // 1. PUSH: Get unsynced audits
    try {
        const unsyncedAudits = await db.getAllAsync('SELECT * FROM audits WHERE synced = 0');

        if (unsyncedAudits.length > 0) {
            console.log(`Found ${unsyncedAudits.length} unsynced audits. Pushing...`);

            const payload = {
                audits: unsyncedAudits
            };

            const response = await axios.post(`${API_URL}/sync/push/`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const { synced_ids } = response.data;

            // Mark as synced
            if (synced_ids.length > 0) {
                for (const id of synced_ids) {
                    await db.runAsync('UPDATE audits SET synced = 1 WHERE id = ?', [id]);
                }
                console.log("Sync Push Success", synced_ids);
            }
        }
    } catch (error) {
        console.error("Sync Push Error", error);
    }
};
