import { create } from 'zustand'
import { CampaignProposal } from './ProposalGeneration'

interface CampaignDraft {
    proposals: CampaignProposal[]
}

interface GlobalState {
    currentCampaignDraft: CampaignDraft
}

export const useGlobal = create<GlobalState>(() => ({
    currentCampaignDraft: {
        proposals: []
    }
}))