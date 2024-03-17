import { Dialog } from 'primereact/dialog'
import { FC } from 'react'

const Preview: FC<{ html: string; visible: boolean; onHide: () => void }> = ({
    html,
    visible,
    onHide,
}) => {
    return (
        <Dialog
            visible={visible}
            onHide={onHide}
            header="Preview (only first pages)"
            style={{ height: 800, backgroundColor: '#fdfd' }}
            className="rounded-md p-2"
            headerStyle={{ fontSize: '1.3rem', fontWeight: 'bold' }}
        >
            <div
                dangerouslySetInnerHTML={{
                    __html: html,
                }}
            />
        </Dialog>
    )
}

export default Preview
