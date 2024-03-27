import domReady from '@wordpress/dom-ready';
import { createRoot, useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from "@wordpress/data";
import { store as noticesStore } from '@wordpress/notices'
import { Button, FontSizePicker, Panel, PanelBody, PanelRow, TextareaControl, ToggleControl, __experimentalHeading as Heading, NoticeList } from '@wordpress/components';
import './index.scss';

const useSettings = () => {
    const [message, setMessage] = useState('Hello, Worlds');
    const [display, setDisplay] = useState(true);
    const [size, setSize] = useState('medium');
    const { createSuccessNotice } = useDispatch(noticesStore);

    useEffect(() => {
        apiFetch({ path: '/wp/v2/settings' }).then((settings) => {
            setMessage(settings.announcement_bar.message);
            setDisplay(settings.announcement_bar.display);
            setSize(settings.announcement_bar.size);
        })
    }, []);

    const saveSettings = () => {
        apiFetch({
            path: '/wp/v2/settings',
            method: 'POST',
            data: {
                announcement_bar: {
                    message,
                    display,
                    size
                }
            }
        }).then(() => {
            createSuccessNotice(
                __('Settings Saved.', 'announcement-bar')
            );
        })

    }

    return {
        message,
        setMessage,
        display,
        setDisplay,
        size,
        setSize,
        saveSettings
    };

}

const Notices = () => {
    const { removeNotice } = useDispatch(noticesStore);
    const notices = useSelect(select => select(noticesStore).getNotices());

    if (notices.length === 0) {
        return null;
    }

    return <NoticeList notices={notices} onRemove={removeNotice} />
}

const MessageControl = ({ value, onChange }) => {
    return (
        <TextareaControl label={__("message", 'announcment-bar')} value={value} onChange={onChange} __nextHasNoMarginBottom />
    )
}

const DisplayControl = ({ value, onChange }) => {
    return (
        <ToggleControl label={__("display", 'announcment-bar')} checked={value} onChange={onChange} __nextHasNoMarginBottom />
    )
}

const SizeControl = ({ value, onChange }) => {
    return (
        <FontSizePicker
            fontSizes={
                [
                    {
                        name: __('Small', 'announcment-bar'),
                        size: 'small',
                        slug: 'small'
                    },
                    {
                        name: __('Medium', 'announcment-bar'),
                        size: 'medium',
                        slug: 'medium'
                    },
                    {
                        name: __('Large', 'announcment-bar'),
                        size: 'large',
                        slug: 'large'
                    },
                    {
                        name: __('Extra Large', 'announcment-bar'),
                        size: 'x-large',
                        slug: 'x-large'
                    }
                ]
            }
            value={value}
            onChange={onChange}
            disableCustomFontSizes={true}
            __nextHasNoMarginBottom
        />
    )
}

const SaveButton = ({ onClick }) => {
    return (
        <Button variant='primary' onClick={onClick}>
            {__('Save', 'announcment-bar')}
        </Button>
    )
}

const SettingsTitle = () => {
    return (
        <Heading level={1}>
            {__("Announcement Bar", 'announcment-bar')}
        </Heading>
    )
}

const SettingsPage = () => {
    const { message, setMessage, display, setDisplay, size, setSize, saveSettings } = useSettings();
    return (
        <>
            <SettingsTitle />
            <Notices />
            <Panel>
                <PanelBody>
                    <PanelRow>
                        <MessageControl
                            value={message}
                            onChange={value => setMessage(value)}
                        />
                    </PanelRow>
                    <PanelRow>
                        <DisplayControl value={display} onChange={value => setDisplay(value)} />
                    </PanelRow>
                </PanelBody>
                <PanelBody
                    title={__('Appearance', 'announcment-bar')}
                    initialOpen={false}
                >
                    <PanelRow>
                        <SizeControl value={size} onChange={value => setSize(value)} />
                    </PanelRow>
                </PanelBody>
            </Panel>
            <SaveButton onClick={saveSettings} />
        </>
    )
}

domReady(() => {
    const root = createRoot(document.getElementById('announcement-bar-settings'));

    root.render(<SettingsPage />);
});