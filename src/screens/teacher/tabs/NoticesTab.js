// src/screens/teacher/tabs/NoticesTab.js

import React from 'react';
import { SectionHeader, NoticeCard, EmptyState } from '../../../components';


export default function NoticesTab({ notices }) {

    return (
        <>
            <SectionHeader title="Notices" subtitle={`${notices.length}`} />

            {notices.length === 0 ? (
                <EmptyState icon="bell" message="No notices." />
            ) : notices.map(n => (
                <NoticeCard key={n.id} {...n} />
            ))}
        </>
    );
}