import os


def log(*args, **kw):
    print(*args, **kw)


def js_file_paths(root_path='.', exclude_paths=None):
    if exclude_paths is None:
        exclude_paths = []

    r = []
    file_names = os.listdir(root_path)
    for name in file_names:
        path = os.path.join(root_path, name)
        if path in exclude_paths:
            continue
        if name.endswith('.js'):
            r.append(path)
        if os.path.isdir(path):
            r.extend(js_file_paths(path, exclude_paths))
    return r


def script_tags_by_paths(paths):
    r = []
    for p in paths:
        tag_path = p.replace('\\', '/').replace('./', '')
        tag = f'<script src='{tag_path}'></script>'
        r.append(tag)
    return r


def write_script_tags(tags):
    with open('index.html', 'r', encoding='utf-8') as f:
        html_str = f.read()
    # 去除已添加的标签
    new_tags = []
    for tag in tags:
        if tag not in html_str:
            new_tags.append(tag)
    new_tags_str = ''
    for tag in new_tags:
        line = ' ' * 8 + tag + '\n'
        new_tags_str += line

    position_str = ".js'></script>\n"
    i = html_str.rfind(position_str) + len(position_str)
    added_str = html_str[:i] + new_tags_str + html_str[i:]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(added_str)
    return new_tags


def __main():
    # 指定扫描开始位置，默认当前目录
    root_path = '.'
    # 指定不扫描的目录或脚本
    exclude_paths = [
        '.\\lib',
        '.\\utils.js',
    ]
    paths = js_file_paths(root_path=root_path, exclude_paths=exclude_paths)
    tags = script_tags_by_paths(paths)
    r = write_script_tags(tags)
    log('add script tags', r)


if __name__ == '__main__':
    __main()
