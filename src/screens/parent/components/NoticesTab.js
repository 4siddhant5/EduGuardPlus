
// src/screens/parent/components/NoticesTab.js

import React from 'react';
import { SectionHeader, NoticeCard, EmptyState } from '../../../components';

export default function NoticesTab({ notices }) {

    return (
        <>
            <SectionHeader title="School Notices" />

            {notices.length === 0 ? (
                <EmptyState icon="bullhorn" message="No notices at this time." />
            ) : (
                notices.map(n => (
                    <NoticeCard
                        key={n.id}
                        title={n.title}
                        message={n.message}
                        createdBy={n.createdBy}
                        createdAt={n.createdAt}
                    />
                ))
            )}
        </>
    );
}